#include "../lib/lygia/sdf/circleSDF.glsl"
#include "../lib/lygia/draw/stroke.glsl"
#include "../lib/lygia/color/palette/heatmap.glsl"
#include "../lib/lygia/draw/digits.glsl"
#include "../lib/lygia/animation/easing/exponential.glsl"
#include "../lib/lygia/color/blend.glsl"
#include "../lib/lygia/space/hexTile.glsl"

#ifndef SHR_SCOPE1
#define SHR_SCOPE1

uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

// uniform sampler2D u_doubleBuffer0;

vec4 scope1(in vec2 xy) {
  vec2 st = xy / u_resolution.xy;
  vec2 pixel = 1. / u_resolution.xy;
  float frame = 0.02 * float(u_frame);
  vec3 color = vec3(0.);

  float shapeFg = texture2D(
    u_perryMonochrome,
    // hexTile(st * 0.01).rg * u_perryMonochromeResolution
    vec2(st.x, st.y - 0.04 * frame)
  ).a;

  #if defined(BUFFER_0)
    vec3 prevColor = texture2D(u_buffer1, st + vec2(0., -0.003)).rgb;
    vec4 value = texture2D(u_tex0, vec2(st.x, 0.5));
    float fft = min(1., 0.5 * texture2D(u_tex0,
    vec2(exponentialIn(st.x), 0.5)).x);
    fft = exponentialOut(fft);
    fft = decimate(fft, 22.);
    float vol = value.y;

    float volNorm = min(1., 2. * (vol - 0.5));
    float volExp = decimate(exponentialOut(volNorm), 10.);
    float spread = 0.02;
    float rY = st.y;
    float gY = rY - spread;
    float bY = gY - spread;
    color = (
      step(rY, 0.5 * fft) * vec3(
        1.0 * fft,
        0.,
        0.
      ) +
      step(bY, 0.5 * fft) * vec3(
        0.,
        gY - 0.2 * fft,
        0.
      ) +
      step(bY, 0.5 * fft) * vec3(
        0.,
        0.,
        0.2 + bY * fft
      )
    );
    color += (
      stroke(
        st.y - 0.25,
        0.5 + volNorm,
        pixel.x * 3.
      // ) * vec3(volExp, 0.5 - 0.5 * volExp, 0.4)
      ) * vec3(0.7)
    );
    color = blendScreen(color, vec3(1.) * shapeFg, 0.1);
    color += 0.9 * decimate(prevColor, 8.);
    // color = vec3(max(0., 4. * (vol - 0.5)));
    // color += digits(
    //   st - vec2(0.10),
    //   texture2D(u_tex0, vec2(0.5, 0.5)).x
    // );

    // color = mix(prevColor, color, 0.5);
  #elif defined(BUFFER_1)
    color = texture2D(u_buffer0, st).rgb;
  #else
    color = texture2D(u_buffer0, st).rgb;
    color = max(vec3(0.), min(vec3(1.), color));
  #endif

  // color = vec3(0.);

  return vec4(color, 1.);
}

#endif
