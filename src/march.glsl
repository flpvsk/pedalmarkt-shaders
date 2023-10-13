#include "../lib/lygia/space/ratio.glsl"
#include "../lib/lygia/space/hexTile.glsl"
#include "../lib/lygia/color/blend.glsl"
#include "../lib/lygia/math/decimate.glsl"
#include "../lib/lygia/generative/cnoise.glsl"
#include "../lib/lygia/color/space/hsv2rgb.glsl"

vec4 march(vec2 xy) {
  vec2 st = xy / u_resolution.xy;
  st = ratio(st, u_resolution);
  float frame = 0.1 * float(u_frame);
  float decimateBase = 8.;
  float noiseValue = 0.5 + 0.5 * cnoise(vec2(
    0.01 * frame, 0.01 * decimate(frame, decimateBase)
  ));
  float scale = 0.007 + 0.002 * decimate(
    1. - 1.2 * noiseValue,
    decimateBase
  );
  float tileScale = (
    (1. - scale) * (1. + 2. * decimate(noiseValue, decimateBase))
  );
  float offset = (1. - scale) * 0.004;
  float speedTime = decimate(frame, 5. + 10. * noiseValue);
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

  float shift = noiseValue * 4.;
  vec3 fgColor = hsv2rgb(vec3(
    0.7 * decimate(shift, decimateBase),
    0.4 * decimate(shift, decimateBase),
    0.8
  ));
  vec3 bgColor = hsv2rgb(vec3(
    1. - 0.7 * decimate(shift, decimateBase),
    (1. - shift) * decimate(shift, decimateBase),
    1. - 0.8
  ));
  vec3 color = (
    shapeFg * fgColor
    + (shapeBg - shapeFg) * bgColor
  );
  float mask = min(1., shapeFg + shapeBg);
  color = (1. - mask) * bgColor + mask * color;
  return vec4(color, 1.);
}
