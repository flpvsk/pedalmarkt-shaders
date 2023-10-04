#ifdef GL_ES
precision mediump float;
#endif

#include "../lib/lygia/space/ratio.glsl"
#include "../lib/lygia/space/hexTile.glsl"
#include "../lib/lygia/color/blend.glsl"
#include "../lib/lygia/math/decimate.glsl"
#include "../lib/lygia/generative/cnoise.glsl"

#include "../lib/lygia/draw/digits.glsl"
#include "../lib/lygia/animation/easing/linear.glsl"
#include "../lib/lygia/generative/voronoise.glsl"

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D u_paperTexture;
uniform vec2 u_paperTextureResolution;

uniform sampler2D u_perryMonochrome;
uniform vec2 u_perryMonochromeResolution;

vec4 march(vec2 st) {
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

float tri(in float t) {
  t = mod(t, 1.);

  if (abs(t) <= 0.5) {
    return 2. * linearIn(t);
  }

  if (abs(t) > 0.5) {
    return 2. * linearOut(1. - t);
  }

  return t;
}

float ramp(in float t) {
  t = mod(t, 1.);
  return linearIn(t);
}

float asr(in float t, in float a, in float s, in float r) {
  float total = a + s + r;
  t = abs(t);
  if (t <= a / total) {
    return linearIn(t * total / a);
  }

  if (t > a / total && t <= (a + s) / total) {
    return 1.;
  }

  if (t > (a + s) / total) {
    return linearOut((1. - t) * total / (a + s));
  }

  return -1.;
}

float square(
  in float t,
  in float rise,
  in float fall,
  in float low,
  in float high
) {
  return -1.;
}

vec4 texturedShape(vec2 st) {
  vec2 paperTexCoord = 0.12 * st;
  float yShift = decimate(
    ramp(u_time * (0.8 + 0.8 * sin(0.0001*u_time))),
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

void main(void) {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st = ratio(st, u_resolution);

  vec4 color1 = texturedShape(st);
  vec4 color2 = march(st);

  float t = mod(u_time * 0.1, 1.);
  float mixVal = asr(t, 0.2, 0.79, 0.01);
  gl_FragColor = (
    mix(color1, color2, mixVal)
    + digits(st, mixVal)
  );
}
