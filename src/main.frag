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

uniform sampler2D u_textTexture;
uniform vec2 u_textTextureResolution;

uniform sampler2D u_fiz1Texture;
uniform vec2 u_fiz1TextureResolution;

uniform sampler2D u_fiz2Texture;
uniform vec2 u_fiz2TextureResolution;

uniform sampler2D u_fiz3Texture;
uniform vec2 u_fiz3TextureResolution;

#include "./rules.glsl"
#include "./texturedShape.glsl"
#include "./march.glsl"
#include "./comet.glsl"
#include "./scope1.glsl"
#include "./text.glsl"

#include "./fiz1.glsl"
#include "./fiz2.glsl"
#include "./fiz3.glsl"

void main(void) {
  vec4 color = vec4(0.);

  #ifdef SCENE_1
    color = scope1(gl_FragCoord.xy);
  #endif

  #ifdef SCENE_2
    color = rules(gl_FragCoord.xy);
  #endif

  #ifdef SCENE_3
    color = fiz3(gl_FragCoord.xy);
  #endif

  #ifdef SCENE_4
    color = comet(gl_FragCoord.xy);
  #endif

  #ifdef SCENE_5
    color = fiz1(gl_FragCoord.xy);
  #endif

  #ifdef SCENE_6
    color = fiz2(gl_FragCoord.xy);
  #endif

  gl_FragColor = color;
}
