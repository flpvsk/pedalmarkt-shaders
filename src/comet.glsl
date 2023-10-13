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
#include "../lib/lygia/color/space/hsv2rgb.glsl"

float sinNorm(in float x) {
  return 0.5 + 0.5 * x;
}

float whenBetween(float x, float lower, float upper) {
  return step(lower, x) * step(x, upper);
}

vec4 comet(vec2 xy) {
  vec2 st = xy / u_resolution.xy;
  vec2 pixel = 1. / u_resolution.xy;
  float frame = 0.3 * float(u_frame);

  st = ratio(st, u_resolution);

  vec3 color = vec3(0.0);
  float easeTime = fract(frame * 0.001);
  float yEase = (
    whenBetween(easeTime, 0., 0.2) * cubicInOut(st.y)
    + whenBetween(easeTime, 0.2, 0.4) * cubicIn(st.y)
    + whenBetween(easeTime, 0.4, 0.6) * exponentialOut(st.y)
    + whenBetween(easeTime, 0.6, 0.8) * exponentialInOut(st.y)
    + whenBetween(easeTime, 0.8, 1.0) * st.y
  );
  float yDec = decimate((1. - yEase), 4.);
  float circles = smoothstep(0., 0.01, fill(
    circleSDF(vec2(st.x, fract(st.y + 0.2 * decimate(frame, 10.)))),
    0.1 + 0.4 * yDec,
    100. * pixel.x
  ));

  float circles2 = smoothstep(0., 0.1, fill(
    circleSDF(vec2(st.x, fract(st.y + 0.2 * decimate(frame, 10.)))),
    0.1 + 0.4 * yDec,
    90. * pixel.x
  ));

  color += circles * hsv2rgb(vec3(
    fract(0.001 * frame + 0.5 * yDec),
    0.3 + 0.7 * fract(frame * 0.01),
    0.3 + 0.7 * fract(frame * 0.1)
  ));

  color += circles2 * hsv2rgb(vec3(
    fract(0.01 * frame + 0.2 * yDec),
    0.7 + 0.3 * fract(frame * 0.1),
    0.7 + 0.3 * fract(frame * 0.01)
  ));

  // color += circles * vec3(
  //   (vec2(frame * 0.1, yDec), 0.1, 0.1),
  //   sin(frame * 0.1 + 0.7) + yDec,
  //   0.2 + sin(frame * 0.1) + circles
  // );


  // color += circles2 * vec3(
  //   (vec2(frame * 0.1, yDec), 0.1, 0.1),
  //   sin(frame * 0.1 + 0.7) + yDec,
  //   0.2 + sin(frame * 0.1) + circles
  // );

  // color += digits(st, easeTime);
  // color -= stroke(lines, 0.1, 0.1);
  return vec4(color, 1.);
}
