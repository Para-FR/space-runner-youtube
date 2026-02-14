export function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} color="#4466aa" />
      <directionalLight position={[10, 20, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, -10, 0]} intensity={0.5} color="#ff4400" />
      <fog attach="fog" args={['#000008', 60, 200]} />
    </>
  );
}
