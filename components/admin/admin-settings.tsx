import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: "",
    contactEmail: "",
    phone: "",
    address: "",
    logo: "",
    theme: "light",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(s => ({ ...s, ...data }));
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaved(true);
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name</label>
                <Input name="storeName" value={settings.storeName} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <Input name="contactEmail" value={settings.contactEmail} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input name="phone" value={settings.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input name="address" value={settings.address} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo URL</label>
                <Input name="logo" value={settings.logo} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Theme</label>
                <Input name="theme" value={settings.theme} onChange={handleChange} />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save Settings</Button>
              {saved && <div className="text-green-600 text-sm mt-2">Settings saved!</div>}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
