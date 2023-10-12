#include "../lib/lygia/space/ratio.glsl"
#include "../lib/lygia/space/hexTile.glsl"
#include "../lib/lygia/color/blend.glsl"
#include "../lib/lygia/math/decimate.glsl"
#include "../lib/lygia/generative/cnoise.glsl"

vec4 march(vec2 xy) {
  vec2 st = xy / u_resolution.xy;
  st = ratio(st, u_resolution);
  float decimateBase = 8.;
  float noiseValue = 0.5 + 0.5 * cnoise(vec2(0.01 * u_time, 0.));
  float scale = 0.007 + 0.002 * decimate(
    1. - noiseValue,
    decimateBase
  );
  float tileScale = (
    (1. - scale) * (1. + 2. * decimate(noiseValue, decimateBase))
  );
  float offset = (1. - scale) * 0.004;
  float speedTime = decimate(u_time, 5. + 10. * noiseValue);
  float speed = (
    speedTime * 0.05
    + speedTime * 0.5 * decimate(noiseValue, decimateBase)
  );

  vec2 shapeTexCoordFg = (
    hexTile(tileScale * vec2(st.x + speed, st.y + speed)).rg
    * scale * u_perryMonochromeResolution
  );
  vec2 shapeTexCoordBg = (
    hexTile(tileScale * vec2(st.x + speed + offset, st.y + speed + offset)).rg
    * scale * u_perryMonochromeResolution
  );

  float shapeFg = texture2D(
    u_perryMonochrome,
    vec2(
      shapeTexCoordFg.x
        * step(0., shapeTexCoordFg.x)
        * step(shapeTexCoordFg.x, 1.)
        * step(0., shapeTexCoordFg.y)
        * step(shapeTexCoordFg.y, 1.),
      shapeTexCoordFg.y
    )
  ).a;

  float shapeBg = texture2D(
    u_perryMonochrome,
    vec2(
      shapeTexCoordBg.x
        * step(0., shapeTexCoordBg.x)
        * step(shapeTexCoordBg.x, 1.)
        * step(0., shapeTexCoordBg.y)
        * step(shapeTexCoordBg.y, 1.),
      shapeTexCoordBg.y
    )
  ).a;

  float shift = noiseValue;
  vec3 bgColor = vec3(
    0.7 * decimate(shift, decimateBase),
    0.4 * decimate(shift, decimateBase),
    0.8
  );
  vec3 color = (
    shapeFg * (1. - bgColor) + vec3(0.3, 0.2, 0.5)
    + (shapeBg - shapeFg) * vec3(shift)
  );
  float mask = min(1., shapeFg + shapeBg);
  color = (1. - mask) * bgColor + mask * color;
  return vec4(color, 1.);
}
