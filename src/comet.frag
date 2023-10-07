#ifdef GL_ES
precision mediump float;
#endif

#include "../lib/lygia/space/ratio.glsl"
#include "../lib/lygia/math/decimate.glsl"
#include "../lib/lygia/generative/cnoise.glsl"

#include "../lib/lygia/draw/digits.glsl"
#include "../lib/lygia/draw/stroke.glsl"
#include "../lib/lygia/draw/fill.glsl"

#include "../lib/lygia/sdf/circleSDF.glsl"
#include "../lib/lygia/sdf/opSubtraction.glsl"
#include "../lib/lygia/sdf/opUnion.glsl"
#include "../lib/lygia/sdf/opIntersection.glsl"

#include "../lib/lygia/animation/easing/cubic.glsl"
#include "../lib/lygia/animation/easing/exponential.glsl"
#include "../lib/lygia/generative/voronoise.glsl"

uniform vec2 u_resolution;
uniform float u_time;

float sinNorm(in float x) {
  return 0.5 + 0.5 * x;
}

float whenBetween(float x, float lower, float upper) {
  return step(lower, x) * step(x, upper);
}

void main(void) {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec2 pixel = 1. / u_resolution.xy;

  st = ratio(st, u_resolution);

  vec3 color = vec3(0.0);
  float easeTime = fract(u_time * 0.001);
  float yEase = (
    whenBetween(easeTime, 0., 0.2) * cubicInOut(st.y)
    + whenBetween(easeTime, 0.2, 0.4) * cubicIn(st.y)
    + whenBetween(easeTime, 0.4, 0.6) * exponentialOut(st.y)
    + whenBetween(easeTime, 0.6, 0.8) * exponentialInOut(st.y)
    + whenBetween(easeTime, 0.8, 1.0) * st.y
  );
  float yDec = decimate((1. - yEase), 4.);
  float circles = smoothstep(0., 0.01, fill(
    circleSDF(vec2(st.x, fract(st.y + 0.2 * decimate(u_time, 10.)))),
    0.1 + 0.4 * yDec,
    100. * pixel.x
  ));

  float circles2 = smoothstep(0., 0.1, fill(
    circleSDF(vec2(st.x, fract(st.y + 0.2 * decimate(u_time, 10.)))),
    0.1 + 0.4 * yDec,
    90. * pixel.x
  ));

  color += circles * vec3(
    voronoise(vec2(u_time * 0.1, yDec), 0.1, 0.1),
    sin(u_time * 0.1 + 0.7) + yDec,
    0.2 + sin(u_time * 0.1) + circles
  );

  color += circles2 * vec3(
    voronoise(vec2(u_time * 0.1, yDec), 0.1, 0.1),
    sin(u_time * 0.1 + 0.7) + yDec,
    0.2 + sin(u_time * 0.1) + circles
  );
  // color += digits(st, easeTime);
  // color -= stroke(lines, 0.1, 0.1);
  gl_FragColor = vec4(color, 1.);
}
