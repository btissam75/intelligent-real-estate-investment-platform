export async function signup(data: {
  full_name: string;
  email: string;
  password: string;
}) {
  const res = await fetch("http://localhost:8000/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function signin(data: { email: string; password: string }) {
  const res = await fetch("http://localhost:8000/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Signin failed");
  return res.json();
}
