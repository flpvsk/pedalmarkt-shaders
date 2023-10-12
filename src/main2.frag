#ifdef GL_ES
precision mediump float;
#endif

#include "../lib/lygia/animation/easing/sineInOut.glsl"

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_frame;

uniform sampler2D u_buffer0;
uniform sampler2D u_buffer1;

uniform sampler2D u_paperTexture;
uniform vec2 u_paperTextureResolution;

uniform sampler2D u_perryMonochrome;
uniform vec2 u_perryMonochromeResolution;

#include "./rules.glsl"
#include "./texturedShape.glsl"
#include "./march.glsl"

void main(void) {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st = ratio(st, u_resolution);

  vec4 color1 = texturedShape(gl_FragCoord.xy);
  vec4 color2 = rules(gl_FragCoord.xy);
  vec4 color3 = march(gl_FragCoord.xy);

  float mixVal = 0.5 + 0.5 * clamp(10. * sin(u_time * 0.1), -1., 1.);
  gl_FragColor = (
    mix(color1, color2, mixVal)
  );
  gl_FragColor = color3;
}
