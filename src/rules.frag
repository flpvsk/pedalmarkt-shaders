#ifdef GL_ES
precision mediump float;
#endif

#include "../lib/lygia/draw/digits.glsl"

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_frame;

uniform float u_rule;

uniform sampler2D u_buffer0;
uniform sampler2D u_buffer1;

void main(void) {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec2 pixel = 1. / u_resolution.xy;

  float rule = 30.;
  vec2 pt = 8. * pixel;
  vec3 color;

  #if defined(BUFFER_0)
    float init = (
      step(1. - st.y, pt.y)
      * step(0.5 - st.x, 0.5 * pt.x)
      * step(st.x, 0.5 * pt.x + 0.5)
    );

    float prevState = step(0.5, texture2D(u_buffer1, st).r);
    float total = -prevState;
    for (int x = -1; x <= 1; x += 1) {
      // for (int y = -1; y <= 1; y += 1) {
        total += (
          pow(2., 1. - float(x))
          * texture2D(u_buffer1, st + pt * vec2(x, 0)).r
        );
      // }
    }

    color = (
      1.
      * init
      + (1. - init)
      * vec3(mod(floor(rule / pow(2., total)), 2.))
      // * step(st.y, 1. - pt.y)
    );
    color = min(vec3(1.), color);
  #elif defined(BUFFER_1)
    color = texture2D(u_buffer0, vec2(st.x, st.y + 1. * pt.y)).rgb;
  #else
    color = texture2D(u_buffer0, st).rgb;

    color += digits(
      st - vec2(0.05),
      mod(floor(rule / pow(2., 0.)), 2.)
    );
  #endif

  gl_FragColor = vec4(color, 1.);
}
