import { useState } from 'react';
import { useCustomAuth } from '@/_core/hooks/useCustomAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, register, loading } = useCustomAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    const result = await login(formData.username, formData.password);
    if (result.success) {
      toast.success('ลงชื่นเข้าสำเร็จ');
      // Redirect will be handled by App.tsx
    } else {
      toast.error(result.error || 'ลงชื่นเข้าไม่สำเร็จ');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error('กรุณากรอกข้อมูลทั้งหมด');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    const result = await register(formData.username, formData.email, formData.password);
    if (result.success) {
      toast.success('สมัครสมาชิกสำเร็จ');
      // Redirect will be handled by App.tsx
    } else {
      toast.error(result.error || 'สมัครสมาชิกไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CE Empire</h1>
          <p className="text-[#A0A0A0]">Banking Dashboard</p>
        </div>

        {/* Card */}
        <Card className="bg-[#1E293B] border-[#334155] shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">
              {isRegistering ? 'สมัครสมาชิก' : 'ลงชื่นเข้า'}
            </CardTitle>
            <CardDescription className="text-[#A0A0A0]">
              {isRegistering
                ? 'สร้างบัญชีใหม่เพื่อเข้าใช้งาน'
                : 'ใส่ชื่อผู้ใช้และรหัสผ่านของคุณ'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  ชื่อผู้ใช้
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="ชื่อผู้ใช้"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="bg-[#0F172A] border-[#334155] text-white placeholder-[#64748B]"
                />
              </div>

              {/* Email (Register only) */}
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    อีเมล
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="อีเมล"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="bg-[#0F172A] border-[#334155] text-white placeholder-[#64748B]"
                  />
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  รหัสผ่าน
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="รหัสผ่าน"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="bg-[#0F172A] border-[#334155] text-white placeholder-[#64748B]"
                />
              </div>

              {/* Confirm Password (Register only) */}
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    ยืนยันรหัสผ่าน
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="ยืนยันรหัสผ่าน"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="bg-[#0F172A] border-[#334155] text-white placeholder-[#64748B]"
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF8C42] hover:bg-[#E67E2F] text-white font-semibold gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    กำลังประมวลผล...
                  </>
                ) : isRegistering ? (
                  <>
                    <UserPlus size={16} />
                    สมัครสมาชิก
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    ลงชื่นเข้า
                  </>
                )}
              </Button>

              {/* Toggle Register/Login */}
              <div className="text-center text-sm">
                <span className="text-[#A0A0A0]">
                  {isRegistering ? 'มีบัญชีแล้ว? ' : 'ยังไม่มีบัญชี? '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setFormData({
                      username: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                    });
                  }}
                  className="text-[#FF8C42] hover:text-[#E67E2F] font-semibold"
                >
                  {isRegistering ? 'ลงชื่นเข้า' : 'สมัครสมาชิก'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[#64748B] mt-8">
          © 2026 CE Empire Banking Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
