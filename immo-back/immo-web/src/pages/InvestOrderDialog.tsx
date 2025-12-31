// src/pages/InvestOrderDialog.tsx
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Alert } from "@mui/material";

export default function InvestOrderDialog() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MAD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const body = {
        to: "0x0000000000000000000000000000000000000001", // temporaire
        title: "Villa Rabat",
        amount: Number(amount),
        currency,
        category: "Achat solo",
      };

      const res = await fetch("http://localhost:3000/api/nft/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Erreur serveur");

      setSuccess(true);
      console.log("NFT Minted ✅", data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open fullWidth>
      <DialogTitle>Investir dans la propriété</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">NFT minté avec succès !</Alert>}
        <TextField label="Montant" fullWidth type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <TextField
          label="Devise"
          select
          fullWidth
          margin="normal"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <MenuItem value="MAD">MAD</MenuItem>
          <MenuItem value="USDC">USDC</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={handleSubmit} variant="contained" color="primary">
          {loading ? "Minting..." : "Confirmer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
