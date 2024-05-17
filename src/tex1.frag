vec4 text(in vec2 xy) {
    vec3 color = vec3(0.0);
    vec2 pixel = 1.0 / u_resolution.xy;
    vec2 st = xy * pixel;

    vec4 tex0 = texture2D(u_textTexture, st);
    color += tex0.rgb * step(0.5, st.x);

    gl_FragColor = vec4(color,1.0);
}
