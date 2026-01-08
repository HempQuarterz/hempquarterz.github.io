import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// --- Shader Code ---

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
varying vec2 vUv;

// Simplex 3D Noise 
// (Standard efficient noise implementation)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  //  x0 = x0 - 0.0 + 0.0 * C.xxx;
  //  x1 = x0 - i1  + 1.0 * C.xxx;
  //  x2 = x0 - i2  + 2.0 * C.xxx;
  //  x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  // Gradients: 7x7x6 points over a cube, mapped onto a 4-hedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

// Domain Warping for Nebula Effect
float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
        total += snoise(p * frequency) * amplitude;
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return total;
}

void main() {
    vec2 uv = vUv;
    
    // Mouse Interaction: subtle displacement
    vec2 mouse = uMouse * 0.5;
    
    // Domain Warping
    // q = coordinates warped by noise
    vec3 q = vec3(uv * 3.0, uTime * 0.1);
    float f = fbm(q + vec3(mouse, 0.0));
    
    // r = second layer of warping, dependent on 'f'
    vec3 r = vec3(uv * 4.0, uTime * 0.15);
    float g = fbm(r + f * 2.0); // feedback f into r
    
    // Final noise value
    float noiseVal = fbm(vec3(uv * 2.0, uTime * 0.2) + g * 3.0);
    
    // Color Palette: Deep Blue / Purple / Gold
    vec3 color1 = vec3(0.05, 0.08, 0.2); // Deep Space Blue
    vec3 color2 = vec3(0.4, 0.1, 0.5);   // Purple Nebula
    vec3 color3 = vec3(1.0, 0.8, 0.3);   // Gold Dust
    
    // Mix colors based on noise
    vec3 finalColor = mix(color1, color2, clamp(g, 0.0, 1.0));
    finalColor = mix(finalColor, color3, pow(noiseVal, 3.0) * 0.5); // Add gold highlights sparingly
    
    // Vignette
    float dist = distance(uv, vec2(0.5));
    finalColor *= 1.0 - dist * 0.8;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

// --- Scene Setup ---

const NebulaPlane = () => {
    const meshRef = useRef();
    const { size } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(size.width, size.height) }
    }), [size]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;

            // Smother mouse movement
            const targetX = (state.mouse.x * 0.5) + 0.5; // NDC to 0-1
            const targetY = (state.mouse.y * 0.5) + 0.5;

            // Simple lerp for smoothness is handled by React Three Fiber's event loop usually, 
            // but we can pass raw mouse data here.
            meshRef.current.material.uniforms.uMouse.value.x = THREE.MathUtils.lerp(
                meshRef.current.material.uniforms.uMouse.value.x,
                targetX,
                0.05
            );
            meshRef.current.material.uniforms.uMouse.value.y = THREE.MathUtils.lerp(
                meshRef.current.material.uniforms.uMouse.value.y,
                targetY,
                0.05
            );
        }
    });

    return (
        <mesh ref={meshRef} scale={[20, 10, 1]}> {/* Large scale to cover screen */}
            <planeGeometry args={[1, 1, 32, 32]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
};

export const NebulaBackground = ({ className }) => {
    return (
        <div className={`fixed inset-0 w-full h-full bg-[#050810] -z-10 ${className}`}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <NebulaPlane />
            </Canvas>
        </div>
    );
};

export default NebulaBackground;
