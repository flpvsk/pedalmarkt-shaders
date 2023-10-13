#ifdef GL_ES
precision lowp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_frame;

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
  vec4 color = vec4(0.);

  #ifdef SCENE_1
    color = rules(gl_FragCoord.xy);
  #endif

  #ifdef SCENE_2
    color = texturedShape(gl_FragCoord.xy);
  #endif

  #ifdef SCENE_3
    color = march(gl_FragCoord.xy);
  #endif

  #ifdef SCENE_4
    color = comet(gl_FragCoord.xy);
  #endif

  gl_FragColor = color;
}
