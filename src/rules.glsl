#include "../lib/lygia/draw/digits.glsl"
#include "../lib/lygia/math/within.glsl"
#include "../lib/lygia/math/decimate.glsl"

#include "../lib/lygia/generative/pnoise.glsl"

#include "../lib/lygia/animation/easing.glsl"

#include "../lib/lygia/color/blend.glsl"
#include "../lib/lygia/color/luma.glsl"

#ifndef SHR_RULES
#define SHR_RULES

float _n1(in float v) {
  return 0.5 + pnoise(vec2(v, v * 0.01), vec2(2.2));
}

float _n2(in float v) {
  return _n1(decimate(fract(v * 0.008), 80.));
}

float _n3(in float v) {
  return _n1(decimate(fract(v * 0.008), 40.));
}

vec4 rules(in vec2 xy) {
  vec2 st = xy / u_resolution.xy;
  vec2 pixel = 1. / u_resolution.xy;
  float frame = 0.02 * float(u_frame);


  // fb
  // st = st + 0.0001;

  // float rule = floor(
  //   256. * pnoise(vec2(frame * 0.001, 0.), vec2(1.))
  // );
  float rule = max(0., min(
    256.,
    floor(mod(frame, 256.) + _n2(frame) * 50.)
  ));
  float maxRows = 120.;
  float rows = maxRows * linearIn(_n3(0.01 * frame));
  float cols = 4. * rows * linearIn(_n1(_n3(0.01 * frame)));

  float rowSize = u_resolution.y * pixel.y / rows;

  float colSize = u_resolution.x * pixel.x / cols;
  vec2 pt = vec2(colSize, rowSize);
  vec3 color;

  float currentRow = floor(
    fract(2. * frame) * rows
  );
  // currentRow = 6.;
  float prevRow = mod(currentRow - 1., rows);
  // prevRow = floor(
  //   prevRow / (1. + 0.5 * exponentialIn(_n2(frame)) * rows)
  // );

  float withinFrame = within(
    st.y,
    1. - (currentRow + 1.) * pt.y,
    1. - currentRow * pt.y
  );

  float midCol = floor(cols / 2.) * colSize;

  #if defined(BUFFER_0)
    float init = (
      step(1. - st.y, pt.y)
      * within(st.x, midCol, midCol + pt.x)
    );

    float prevRowY = 1. - (prevRow + 0.5) * rowSize;
    float cellNumX = ceil(st.x / colSize);
    float cellX = (cellNumX + 0.5) * colSize;

    vec3 prevColor = texture2D(u_buffer1, vec2(cellX, prevRowY)).rgb;
    float prevState = step(0.5, prevColor.r);
    float total = -prevState;
    for (int x = -1; x <= 1; x += 1) {
      float xf = float(x);
      vec2 coord = vec2(
        (cellNumX + xf + xf * 0.5) * colSize,
        prevRowY
      );

      total += (
        pow(2., 1. - float(x))
        * texture2D(u_buffer1, coord).r
      );
    }

    color = (
      1.
      * init * vec3(1. - prevState)
      + (1. - init)
      * vec3(mod(floor(rule / pow(2., total)), 2.))
    ) * withinFrame
    + texture2D(u_buffer1, st).rgb * (1. - withinFrame);

    color = min(vec3(1.), color);
  #elif defined(BUFFER_1)
    color = 1.0 * texture2D(u_buffer0, st).rgb;
  #else
    color = texture2D(u_buffer0, st).rgb;

    color = (
      withinFrame * vec3(0.0, 0.2, 0.2) +
      withinFrame * color * vec3(0.4, 0.3, 0.2) +
      (1. - withinFrame) * color * vec3(0.5, 0.1, 0.3)
    );

    color += digits(
      st - vec2(0.10),
      // frame
      // mod(floor(rule / pow(2., 0.)), 2.)
      // currentRow
      rule
      // rows
      // resolution.y
      // rowSize
    );
    color = min(vec3(1.), color);

    color = blendScreen(
      color,
      texture2D(u_paperTexture, st * 0.4 + vec2(0.1, 0.1)).rgb,
      0.3 * (1. - luma(color))
    );

  #endif

  // color = vec3(0.);
  return vec4(color, 1.);
}

#endif
