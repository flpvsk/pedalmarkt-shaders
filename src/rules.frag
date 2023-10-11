#ifdef GL_ES
precision mediump float;
#endif

#include "../lib/lygia/draw/digits.glsl"
#include "../lib/lygia/math/within.glsl"
#include "../lib/lygia/math/sign.glsl"

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_frame;

uniform float u_rule;

uniform sampler2D u_buffer0;
uniform sampler2D u_buffer1;

void main(void) {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec2 pixel = 1. / u_resolution.xy;

  // fb
  // st = st + 0.001 * sin(u_time * 0.1);

  float rule = 230.;
  float rows = 120.;
  float cols = 70.;

  float rowSize = u_resolution.y * pixel.y / rows;
  // rowSize = floor(rowSize / pixel.y) * pixel.y;

  float colSize = u_resolution.x * pixel.x / cols;
  // colSize = floor(colSize / pixel.x) * pixel.x;
  vec2 pt = vec2(colSize, rowSize);
  vec3 color;

  float currentRow = floor(
    fract(u_time * 0.1) * rows
  );
  // currentRow = 6.;
  float prevRow = mod(currentRow - 1., rows);

  float withinFrame = within(
    st.y,
    1. - (currentRow + 1.) * pt.y,
    1. - currentRow * pt.y
  );

  float midCol = floor(cols / 2.) * colSize;

  #if defined(BUFFER_0)
    float init = (
      step(1. - st.y, pt.y)
      * within(st.x, midCol, midCol + pt.x)
    );

    float prevRowY = 1. - (prevRow + 0.5) * rowSize;
    float cellNumX = ceil(st.x / colSize);
    float cellX = (cellNumX + 0.5) * colSize;

    vec3 prevColor = texture2D(u_buffer1, vec2(cellX, prevRowY)).rgb;
    float prevState = step(0.5, prevColor.r);
    float total = -prevState;
    for (int x = -1; x <= 1; x += 1) {
      float xf = float(x);
      vec2 coord = vec2(
        (cellNumX + xf + xf * 0.5) * colSize,
        prevRowY
      );

      total += (
        pow(2., 1. - float(x))
        * texture2D(u_buffer1, coord).r
      );
    }

    color = (
      1.
      * vec3(init)
      + (1. - init)
      * vec3(mod(floor(rule / pow(2., total)), 2.))
    ) * withinFrame
    + texture2D(u_buffer1, st).rgb * (1. - withinFrame);

    color = min(vec3(1.), color);
  #elif defined(BUFFER_1)
    color = 1.0 * texture2D(u_buffer0, st).rgb;
  #else
    color = texture2D(u_buffer0, st).rgb;

    float tooDark = within(color.r, 0.0, 0.1);
    color = tooDark * vec3(0.2, 0.3, 0.5) + (1. - tooDark) * color;

    color = (
      withinFrame * vec3(0.1, 0.12, 0.1) +
      withinFrame * color * vec3(0.4, 0.3, 0.2) +
      (1. - withinFrame) * color * vec3(0.5, 0.1, 0.3)
    );


    color += digits(
      st - vec2(0.05),
      // fract(u_time)
      // mod(floor(rule / pow(2., 0.)), 2.)
      // currentRow
      rule
      // u_resolution.y
      // rowSize
    );
  #endif

  // color = vec3(0.);
  gl_FragColor = vec4(color, 1.);
}
