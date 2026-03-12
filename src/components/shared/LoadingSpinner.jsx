const LoadingSpinner = ({ color = '#3B82F6' }) => (
  <div className="flex items-center justify-center gap-1.5 py-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-3 h-3 rounded-full animate-bounce"
        style={{
          backgroundColor: color,
          animationDelay: `${i * 0.15}s`,
          animationDuration: '0.8s',
        }}
      />
    ))}
  </div>
);

export default LoadingSpinner;
