import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl';

const hexToRgb = (hex) => {
  if (!hex) return [0.062, 0.725, 0.506]; // #10B981
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const int = parseInt(hex.slice(0, 6), 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  return [r, g, ((int & 255) / 255)];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec3 uTopColor;
  uniform vec3 uBottomColor;
  uniform float uIntensity;
  uniform float uPillarWidth;
  uniform float uPillarHeight;
  uniform float uGlowAmount;
  uniform float uNoiseIntensity;
  uniform float uRotation;

  varying vec2 vUv;

  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 st = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

    float rad = radians(uRotation);
    mat2 rot = mat2(cos(rad), -sin(rad), sin(rad), cos(rad));
    vec2 pos = rot * st;

    float n1 = snoise(vec2(pos.x * 4.0, pos.y * 2.0 - uTime * 0.6));
    float n2 = snoise(vec2(pos.x * 8.0 + 2.5, pos.y * 4.0 + uTime * 1.0));
    float n3 = snoise(vec2(pos.x * 16.0 - 1.2, pos.y * 8.0 - uTime * 1.4));
    float noise = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * uNoiseIntensity;

    float dist = abs(pos.x + noise * 0.12);
    float beamWidth = max(uPillarWidth * 0.05, 0.01);
    float pillar = exp(-pow(dist / beamWidth, 2.0));

    float glow = (uGlowAmount * 15.0) / (dist + 0.015);
    float heightFade = smoothstep(uPillarHeight + 0.8, -uPillarHeight - 0.8, pos.y);

    float alpha = clamp((pillar + glow) * uIntensity * heightFade, 0.0, 1.0);
    vec3 color = mix(uBottomColor, uTopColor, smoothstep(-0.8, 0.8, pos.y + 0.2));

    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

export const LightPillar = ({
  topColor = '#10B981',
  bottomColor = '#000000',
  intensity = 1.1,
  rotationSpeed = 0.5,
  glowAmount = 0.008,
  pillarWidth = 2,
  pillarHeight = 0.6,
  noiseIntensity = 2,
  pillarRotation = -30,
  interactive = false,
  mixBlendMode = 'normal',
  quality = 'high',
  className = '',
  style = {},
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.display = 'block';
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 0, 5);

    const scene = new Transform();

    const geometry = new Geometry(gl, {
      position: {
        size: 3,
        data: new Float32Array([
          -5, -5, 0,
          5, -5, 0,
          -5, 5, 0,
          -5, 5, 0,
          5, -5, 0,
          5, 5, 0,
        ]),
      },
      uv: {
        size: 2,
        data: new Float32Array([
          0, 0,
          1, 0,
          0, 1,
          0, 1,
          1, 0,
          1, 1,
        ]),
      },
    });

    const topRgb = hexToRgb(topColor);
    const botRgb = hexToRgb(bottomColor);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uTime: { value: 0 },
        uTopColor: { value: topRgb },
        uBottomColor: { value: botRgb },
        uIntensity: { value: intensity },
        uPillarWidth: { value: pillarWidth },
        uPillarHeight: { value: pillarHeight },
        uGlowAmount: { value: glowAmount },
        uNoiseIntensity: { value: noiseIntensity },
        uRotation: { value: pillarRotation },
      },
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    const resize = () => {
      if (!container) return;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    window.addEventListener('resize', resize);
    resize();

    let animId;
    let startTime = performance.now();

    const render = () => {
      animId = requestAnimationFrame(render);
      const currentTime = (performance.now() - startTime) * 0.001 * rotationSpeed;

      program.uniforms.uTime.value = currentTime;
      program.uniforms.uTopColor.value = hexToRgb(topColor);
      program.uniforms.uBottomColor.value = hexToRgb(bottomColor);
      program.uniforms.uIntensity.value = intensity;
      program.uniforms.uPillarWidth.value = pillarWidth;
      program.uniforms.uPillarHeight.value = pillarHeight;
      program.uniforms.uGlowAmount.value = glowAmount;
      program.uniforms.uNoiseIntensity.value = noiseIntensity;
      program.uniforms.uRotation.value = pillarRotation;

      renderer.render({ scene, camera });
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      if (gl.canvas && container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    topColor,
    bottomColor,
    intensity,
    rotationSpeed,
    glowAmount,
    pillarWidth,
    pillarHeight,
    noiseIntensity,
    pillarRotation,
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className}`}
      style={{ mixBlendMode, ...style }}
    />
  );
};

export default LightPillar;
