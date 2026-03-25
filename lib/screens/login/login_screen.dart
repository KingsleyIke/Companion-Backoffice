import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/shared_widgets.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    final auth = context.read<AuthProvider>();    
    final success = await auth.login(_emailCtrl.text.trim(), _passCtrl.text);
    
    
    // For success, try to show snackbar even if mounted becomes false
    // because the router will navigate immediately and unmount this screen
    if (success) {
      try {
        // Try immediately first
        showCustomSnackbar(context, 'Login successful! Welcome back.', isSuccess: true);
        _emailCtrl.clear();
        _passCtrl.clear();
      } catch (e) {
      }
      // Router will handle navigation automatically
      return;
    }
    
    // For errors, show snackbar only if still mounted
    if (!mounted) {
      return;
    }
    
    if (auth.error != null) {
      try {
        showCustomSnackbar(context, auth.error!, isSuccess: false);
      } catch (e) {}
    }
  }

  Future<void> _showForgotPasswordDialog() async {
    final auth = context.read<AuthProvider>();
    final screenContext = context;

    await showDialog(
      context: screenContext,
      builder: (_) => _ForgotPasswordDialog(
        auth: auth,
        onResult: (success, message) =>
            showCustomSnackbar(screenContext, message, isSuccess: success),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isWide = MediaQuery.sizeOf(context).width >= 900;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Branding panel ────────────────────────────────────────────────
          if (isWide)
            Expanded(
              child: Container(
                color: AppColors.sidebarBg,
                padding: const EdgeInsets.all(48),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      SizedBox(height: 60),
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
                      SizedBox(height: 60),
                    ],
                  ),
                ),
              ),
            ),

          // ── Login form ────────────────────────────────────────────────────
          Expanded(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(35),
                // constraints: const BoxConstraints(maxWidth: 440),
                child: Form(
                  key: _formKey,
                  child: Column(
                      mainAxisSize: MainAxisSize.min,
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
                              v == null || v.isEmpty ? 'Password is required' : null,
                        ),
                        const SizedBox(height: 8),

                        // Forgot Password Link
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: _showForgotPasswordDialog,
                            child: const Text('Forgot password?',
                                style: TextStyle(fontSize: 12)),
                          ),
                        ),
                        const SizedBox(height: 16),

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

// ── Forgot Password Dialog ────────────────────────────────────────────────────
class _ForgotPasswordDialog extends StatefulWidget {
  final AuthProvider auth;
  final void Function(bool success, String message) onResult;

  const _ForgotPasswordDialog({required this.auth, required this.onResult});

  @override
  State<_ForgotPasswordDialog> createState() => _ForgotPasswordDialogState();
}

class _ForgotPasswordDialogState extends State<_ForgotPasswordDialog> {
  final _emailCtrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_emailCtrl.text.trim().isEmpty) {
      widget.onResult(false, 'Please enter your email');
      return;
    }

    setState(() => _loading = true);
    final success = await widget.auth.sendPasswordResetEmail(_emailCtrl.text.trim());
    if (!mounted) return;

    final message = success
        ? 'Password reset link sent. Check your inbox.'
        : widget.auth.error ?? 'Failed to send password reset email';

    Navigator.pop(context);
    widget.onResult(success, message);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Forgot Password?'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Enter your email address to receive a password reset link.'),
          const SizedBox(height: 16),
          TextFormField(
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
            autofocus: true,
            onFieldSubmitted: (_) => _submit(),
            decoration: const InputDecoration(
              hintText: 'your@email.com',
              border: OutlineInputBorder(),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _loading ? null : () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _loading ? null : _submit,
          child: _loading
              ? const SizedBox(
                  width: 16, height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Text('Send Reset Link'),
        ),
      ],
    );
  }
}
