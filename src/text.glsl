#include "../lib/lygia/math/within.glsl"

#ifndef SHR_TEXT
#define SHR_TEXT

vec4 text(in vec2 xy) {
  vec3 color = vec3(0.0);
  vec2 pixel = 1.0 / u_resolution.xy;
  vec2 st = xy * pixel;

  float frame = 0.005 * float(u_frame);
  frame = frame * frame;
  float rows = 50. * _n1(floor(10. * frame));
  float rowSize = 1. / rows;
  float currentRow = floor(
    fract(frame) * rows
  );
  // currentRow = mod(currentRow, rows);

  float withinFrame = within(
    fract(10. * st.y * (0.5 - st.y)),
    1. - (currentRow + 1.) * rowSize,
    1. - currentRow * rowSize
  );

  vec4 tex0 = texture2D(
    u_textTexture,
    vec2(
      withinFrame * (st.x + (rowSize - rowSize * _n1(0.0001 * float(u_frame)))) +
      (1. - withinFrame) * st.x,
      st.y
    )
  );
  color = vec3(0.14);
  color += tex0.a * vec3(0.8);
  color += withinFrame * vec3(0.01,0.05,0.02);

  return vec4(color, 1.0);
}

#endif
