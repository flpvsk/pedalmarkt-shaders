#ifdef GL_ES
precision mediump float;
#endif

#include "../lib/lygia/animation/easing/sineInOut.glsl"
#include "../lib/lygia/color/distance.glsl"
#include "../lib/lygia/color/space/rgb2hsv.glsl"

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
#include "./comet.glsl"

void main(void) {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st = ratio(st, u_resolution);
  float parts = 5.;

  vec4 color1 = texturedShape(gl_FragCoord.xy);
  vec4 color2 = rules(gl_FragCoord.xy);
  vec4 color3 = march(gl_FragCoord.xy);
  vec4 color4 = comet(gl_FragCoord.xy);
  vec4 color5 = vec4(
    rgb2hsv(vec3(st.y, 0.4, colorDistance(color3, color4))),
  1.);

  vec4 renders[5];
  renders[0] = color1;
  renders[1] = color2;
  renders[2] = color3;
  renders[3] = color4;
  renders[4] = color5;

  float idx = floor(mod(u_time * 0.1, parts));
  // float prevIdx = mod(idx - 1., parts);
  // float mixVal = 0.5 + 0.5 * clamp(10. * sin(u_time * 0.1), -1., 1.);
  // gl_FragColor = (
  //   mix(renders[int(prevIdx)], renders[int(idx)], mixVal)
  // );

  gl_FragColor = renders[int(idx)];
}
