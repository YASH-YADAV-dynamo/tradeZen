/** Web uses @privy-io/react-auth modals — no PrivyElements on native runtime. */
export function PrivyNativeRuntime({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <>{children}</>;
}
