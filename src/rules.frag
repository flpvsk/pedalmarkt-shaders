#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_frame;

uniform sampler2D u_buffer0;
uniform sampler2D u_buffer1;

#include "./rules.glsl"

void main(void) {
  RulesParams p;
  gl_FragColor = rules(gl_FragCoord.xy, p);
}
