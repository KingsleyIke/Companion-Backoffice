import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey     = GlobalKey<FormState>();
  final _emailCtrl   = TextEditingController(text: 'kingsdanike@gmail.com');
  final _passCtrl    = TextEditingController(text: 'Admin1234!');
  bool _obscure      = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    await auth.login(_emailCtrl.text.trim(), _passCtrl.text);
    if (mounted && auth.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error!), backgroundColor: AppColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth   = context.watch<AuthProvider>();
    final isWide = MediaQuery.of(context).size.width >= 900;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Row(
        children: [
          // ── Branding panel (wide screens) ──────────────────────────────────
          if (isWide)
            Expanded(
              child: Container(
                color: AppColors.sidebarBg,
                child: const Center(
                  child: Padding(
                    padding: EdgeInsets.all(48),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.church, color: Colors.white, size: 60),
                        SizedBox(height: 24),
                        Text('Catholic Companion',
                            style: TextStyle(color: Colors.white, fontSize: 32,
                                fontWeight: FontWeight.w800)),
                        SizedBox(height: 8),
                        Text('Back Office Admin Panel',
                            style: TextStyle(color: Colors.white70, fontSize: 16)),
                        SizedBox(height: 32),
                        _FeatureBullet(icon: Icons.location_city_outlined,
                            text: 'Manage parishes & contacts'),
                        _FeatureBullet(icon: Icons.menu_book_outlined,
                            text: 'Add & publish daily readings'),
                        _FeatureBullet(icon: Icons.check_circle_outline,
                            text: 'Review contributor approvals'),
                        _FeatureBullet(icon: Icons.people_outline,
                            text: 'Manage users & roles'),
                      ],
                    ),
                  ),
                ),
              ),
            ),

          // ── Login form ─────────────────────────────────────────────────────
          SizedBox(
            width: isWide ? 440 : double.infinity,
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(40),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (!isWide) ...[
                        const Icon(Icons.church, color: AppColors.primary, size: 40),
                        const SizedBox(height: 12),
                      ],
                      const Text('Sign In',
                          style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary)),
                      const SizedBox(height: 6),
                      const Text('Catholic Companion — Back Office',
                          style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      const SizedBox(height: 32),

                      // Email
                      const _Label('Email address'),
                      TextFormField(
                        controller: _emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          hintText: 'admin@example.com',
                          prefixIcon: Icon(Icons.email_outlined, size: 18),
                        ),
                        validator: (v) =>
                            v == null || !v.contains('@') ? 'Enter a valid email' : null,
                      ),
                      const SizedBox(height: 16),

                      // Password
                      const _Label('Password'),
                      TextFormField(
                        controller: _passCtrl,
                        obscureText: _obscure,
                        decoration: InputDecoration(
                          hintText: '••••••••',
                          prefixIcon: const Icon(Icons.lock_outline, size: 18),
                          suffixIcon: IconButton(
                            icon: Icon(_obscure
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                                size: 18),
                            onPressed: () => setState(() => _obscure = !_obscure),
                          ),
                        ),
                        onFieldSubmitted: (_) => _submit(),
                        validator: (v) =>
                            v == null || v.length < 6 ? 'Password too short' : null,
                      ),
                      const SizedBox(height: 28),

                      // Submit
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: auth.isLoading ? null : _submit,
                          child: auth.isLoading
                              ? const SizedBox(
                                  width: 20, height: 20,
                                  child: CircularProgressIndicator(
                                      color: Colors.white, strokeWidth: 2))
                              : const Text('Sign In'),
                        ),
                      ),

                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Demo credentials',
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                                    color: AppColors.primary)),
                            SizedBox(height: 4),
                            Text('Email: kingsdanike@gmail.com\nPassword: Admin1234!',
                                style: TextStyle(fontSize: 11, color: AppColors.primary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                color: AppColors.textSecondary)),
      );
}

class _FeatureBullet extends StatelessWidget {
  final IconData icon;
  final String text;
  const _FeatureBullet({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Row(
          children: [
            Icon(icon, color: Colors.white70, size: 18),
            const SizedBox(width: 10),
            Text(text, style: const TextStyle(color: Colors.white70, fontSize: 14)),
          ],
        ),
      );
}
