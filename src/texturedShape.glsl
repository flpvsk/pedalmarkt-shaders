#include "../lib/lygia/space/ratio.glsl"
#include "../lib/lygia/color/blend.glsl"
#include "../lib/lygia/math/decimate.glsl"
#include "../lib/lygia/animation/easing/linear.glsl"
#include "../lib/lygia/generative/voronoise.glsl"

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
  st = ratio(st, u_resolution);
  vec2 paperTexCoord = 0.12 * st;
  float yShift = decimate(
    _ramp(u_time * (0.8 + 0.8 * sin(0.0001*u_time))),
    6.
  );
  paperTexCoord = vec2(
    paperTexCoord.x + 0.04,
    paperTexCoord.y + 0.03 + yShift
  );
  vec3 paperTexColor = texture2D(u_paperTexture, paperTexCoord).rgb;

  float n = voronoise(vec2(st.x, st.y + yShift) * 10.0, 0.9, 0.9);
  vec3 color = vec3(st.x, st.y - 0.1 * n, abs(sin(u_time * 0.3)));

  vec2 shapeTexCoord = (
    vec2(st.x + 0.01 * n, st.y + 0.08 * yShift)
    * 0.0055 * u_perryMonochromeResolution
  );
  float shape = texture2D(
    u_perryMonochrome,
    vec2(
      shapeTexCoord.x
        * step(0., shapeTexCoord.x)
        * step(shapeTexCoord.x, 1.),
      shapeTexCoord.y
    )
  ).a;

  color = decimate(color, 30.);
  color = blendOverlay(color, shape * vec3(0.8), 0.8);
  color = blendAdd(color, paperTexColor, 0.6);

  return vec4(color, 1.);
}
