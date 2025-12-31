// immo-web/src/lib/siwe.ts
export async function signInWithEthereum() {
  if (!window.ethereum) throw new Error("MetaMask non détecté");

  // 1) nonce
  const nonceRes = await fetch("/auth/nonce", { credentials: "include" });
  const { nonce } = await nonceRes.json();

  // 2) demander l’adresse + signer
  const [addr] = await window.ethereum!.request({ method: "eth_requestAccounts" });
  const domain = window.location.host;
  const message =
`domain: ${domain}
address: ${addr}
statement: Login
nonce: ${nonce}
issuedAt: ${new Date().toISOString()}`;

  const signature: string = await window.ethereum!.request({
    method: "personal_sign",
    params: [message, addr],
  });

  // 3) vérif serveur → cookie de session + retourne adresse
  const verify = await fetch("/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ address: addr, message, signature }),
  });
  if (!verify.ok) throw new Error("Vérification SIWE échouée");

  // flag local pour RequireAuth
  localStorage.setItem("token", "1");
  return { address: addr as string };
}
