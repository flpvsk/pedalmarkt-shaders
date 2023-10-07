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

#include "../lib/lygia/animation/easing/linear.glsl"
#include "../lib/lygia/generative/voronoise.glsl"

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D u_fullOfTextTexture;
uniform vec2 u_fullOfTextTextureResolution;

void main(void) {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec2 pixel = 1. / u_resolution.xy;

  st = ratio(st, u_resolution);
  vec2 texCoord = 0.001 * st * u_fullOfTextTextureResolution;
  vec4 texColor = texture2D(
    u_fullOfTextTexture,
    vec2(
      texCoord.x
        * step(0., texCoord.x)
        * step(texCoord.x, 1.)
        * step(0., texCoord.y)
        * step(texCoord.y, 1.),
      texCoord.y
    )
  );

  vec3 color = vec3(1.);
  float lines = stroke(
    fract(100. * st.x + st.x * 40. * sin(0.01 * u_time)),
    0.10,
    fract(st.y * 2.) * texColor.a * 1.0
  );
  float circles = stroke(
    circleSDF(vec2(fract(st.x * 20.), fract(st.y * 20.))),
    0.7,
    50. * pixel.x * (1. - lines)
  );
  circles += fill(
    circleSDF(vec2(fract(st.x * 20. + u_time), 20. * st.y - 0.0)),
    0.2 + 0.4 * decimate((1. - st.x), 4.),
    50. * pixel.x
  );

  circles += fill(
    circleSDF(vec2(fract(st.x * 20. - u_time), 20. * st.y - 19.0)),
    0.2 + 0.4 * st.x,
    50. * pixel.x
  );


  float circlesAndLines = circles + lines;
  color -= circlesAndLines;
  // color -= stroke(lines, 0.1, 0.1);
  gl_FragColor = vec4(color, 1.);
}
