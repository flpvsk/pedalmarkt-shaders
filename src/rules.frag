#ifdef GL_ES
precision highp float;
#endif

#include "../lib/lygia/draw/digits.glsl"
#include "../lib/lygia/math/within.glsl"

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_frame;

uniform float u_rule;

uniform sampler2D u_buffer0;
uniform sampler2D u_buffer1;

void main(void) {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec2 pixel = 1. / u_resolution.xy;

  float rule = 13.;
  float rows = 12.;
  float cols = 12.;

  float rowSize = u_resolution.y * pixel.y / rows;
  // rowSize = floor(rowSize / pixel.y) * pixel.y;

  float colSize = u_resolution.x * pixel.x / cols;
  // colSize = floor(colSize / pixel.x) * pixel.x;
  vec2 pt = vec2(colSize, rowSize);
  vec3 color;

  float currentRow = floor(
    fract(u_time * 0.2) * rows
  );

  float withinFrame = within(
    st.y,
    1. - (currentRow + 1.) * pt.y,
    1. - currentRow * pt.y
  );

  #if defined(BUFFER_0)
    float init = (
      step(1. - st.y, pt.y)
      * within(st.x, 1. - pt.x, 1.)
    );

    vec3 prevColor = texture2D(u_buffer1, st + vec2(0., pt.y)).rgb;
    float prevState = step(0.5, prevColor.r);
    float total = -prevState;
    for (int x = -1; x <= 1; x += 1) {
      // for (int y = -1; y <= 1; y += 1) {
        vec2 coord = vec2(st.x + pt.x * float(x), st.y + pt.y);
        total += (
          pow(2., 1. - float(x))
          * texture2D(u_buffer1, coord).r
        );
      // }
    }
    color = (
      1.
      // * init
      // + (1. - init)
      * vec3(mod(floor(rule / pow(2., total)), 2.))
      // vec3(1.)
    ) * withinFrame
    + texture2D(u_buffer1, st).rgb * (1. - withinFrame);

    color = min(vec3(1.), color);
  #elif defined(BUFFER_1)
    color = 1.0 * texture2D(u_buffer0, st).rgb;
  #else
    color = texture2D(u_buffer0, st).rgb;
    color = (
      withinFrame * vec3(0.5) +
      (1. - withinFrame) * color * vec3(0.1, 0.1, fract(st.x))
    );
    // color = withinFrame * vec3(0.5);
    // color = vec3(step(st.y, 1. - pt.y));

    color += digits(
      st - vec2(0.05),
      // fract(u_time)
      // mod(floor(rule / pow(2., 0.)), 2.)
      currentRow
      // u_resolution.y
      // rowSize
    );
  #endif

  // color = vec3(0.);
  gl_FragColor = vec4(color, 1.);
}
