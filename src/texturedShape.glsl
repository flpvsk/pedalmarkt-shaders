#include "../lib/lygia/space/ratio.glsl"
#include "../lib/lygia/color/blend.glsl"
#include "../lib/lygia/math/decimate.glsl"
#include "../lib/lygia/animation/easing/linear.glsl"

#ifndef SHR_TEX_SHAPE
#define SHR_TEX_SHAPE

float _tri(in float t) {
  t = mod(t, 1.);

  if (abs(t) <= 0.5) {
    return 2. * linearIn(t);
  }

  if (abs(t) > 0.5) {
    return 2. * linearOut(1. - t);
  }

  return t;
}

float _ramp(in float t) {
  t = mod(t, 1.);
  return linearIn(t);
}

vec4 texturedShape(vec2 xy) {
  vec2 st = xy / u_resolution.xy;
  float frame = 0.1 * float(u_frame);
  st = ratio(st, u_resolution);
  vec2 paperTexCoord = 0.12 * st;
  float yShift = decimate(
    _ramp(frame * (0.8 + 0.8 * sin(0.0001*frame))),
    6.
  );
  paperTexCoord = vec2(
    paperTexCoord.x + 0.04,
    paperTexCoord.y + 0.03 + yShift
  );
  vec3 paperTexColor = texture2D(u_paperTexture, paperTexCoord).rgb;

  float n = 0.5 + 0.5 * sin(st.x + st.y + yShift * 10.0);
  vec3 color = vec3(st.x, st.y - 0.1 * n, abs(sin(frame * 0.3)));

  vec2 shapeTexCoord = (
    vec2(st.x + 0.01 * n, st.y - 0.1 + 0.08 * yShift)
    * 0.0155 * u_perryMonochromeResolution
  );
  float shape = texture2D(
    u_perryMonochrome,
    vec2(
      shapeTexCoord.x
        * step(0., shapeTexCoord.x)
        * step(shapeTexCoord.x, 1.),
      shapeTexCoord.y
        * step(0., shapeTexCoord.y)
        * step(shapeTexCoord.y, 1.)
    )
  ).a;

  color = decimate(color, 30.);
  color = blendOverlay(color, shape * vec3(0.8), 0.8);
  color = blendAdd(color, paperTexColor, 0.6);

  return vec4(color, 1.);
}

#endif
