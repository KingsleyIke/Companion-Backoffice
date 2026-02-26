import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart' hide AuthProvider;
import 'package:companion/constants/user_roles.dart';
import 'package:companion/features/auth/presentation/providers/auth_provider.dart';
import 'package:companion/navigation/app_router.dart';
import 'package:companion/features/shared/widgets/app_drawer.dart';

/// Sign up screen for back office
class SignUpScreen extends StatefulWidget {
  const SignUpScreen({Key? key}) : super(key: key);

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _passwordController;
  late TextEditingController _confirmPasswordController;

  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  UserRole _selectedRole = UserRole.user;

  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _firstNameController = TextEditingController();
    _lastNameController = TextEditingController();
    _emailController = TextEditingController();
    _phoneController = TextEditingController();
    _passwordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String? _validateEmail(String? value) {
    if (value?.isEmpty ?? true) {
      return 'Email is required';
    }
    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value!)) {
      return 'Please enter a valid email';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value?.isEmpty ?? true) {
      return 'Password is required';
    }
    if (value!.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value?.isEmpty ?? true) {
      return 'Please confirm your password';
    }
    if (value != _passwordController.text) {
      return 'Passwords do not match';
    }
    return null;
  }

  void _handleSignUp() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    try {
      final authProvider = context.read<AuthProvider>();
      // Get current logged-in user's UID (if any) as createdBy
      final currentUserUID = FirebaseAuth.instance.currentUser?.uid;
      
      final success = await authProvider.signUp(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        phoneNumber: _phoneController.text.trim().isEmpty ? null : _phoneController.text.trim(),
        role: _selectedRole,
        createdBy: currentUserUID,
      );

      if (!mounted) {
        return;
      }

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Account created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        
        // Navigate to home
        await Navigator.of(context).pushReplacementNamed(AppRouter.homeRoute);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.errorMessage ?? 'Sign up failed'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  List<Widget> _buildFormFields(BuildContext context) {
    return [
      // Logo/Header
      Center(
        child: Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            gradient: LinearGradient(
              colors: [Colors.blue[400]!, Colors.blue[700]!],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: const Icon(
            Icons.person_add,
            color: Colors.white,
            size: 40,
          ),
        ),
      ),
      const SizedBox(height: 30),

      // Title
      Text(
        'Create Account',
        textAlign: TextAlign.center,
        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.blue[700],
            ),
      ),
      const SizedBox(height: 10),

      // Subtitle
      Text(
        'Set up your back office account',
        textAlign: TextAlign.center,
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: Colors.grey[600],
            ),
      ),
      const SizedBox(height: 30),

      // First Name Field
      TextFormField(
        controller: _firstNameController,
        decoration: InputDecoration(
          labelText: 'First Name *',
          prefixIcon: const Icon(Icons.person),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
          ),
        ),
        validator: (value) {
          if (value?.isEmpty ?? true) {
            return 'First name is required';
          }
          return null;
        },
      ),
      const SizedBox(height: 16),

      // Last Name Field
      TextFormField(
        controller: _lastNameController,
        decoration: InputDecoration(
          labelText: 'Last Name *',
          prefixIcon: const Icon(Icons.person),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
          ),
        ),
        validator: (value) {
          if (value?.isEmpty ?? true) {
            return 'Last name is required';
          }
          return null;
        },
      ),
      const SizedBox(height: 16),

      // Email Field
      TextFormField(
        controller: _emailController,
        decoration: InputDecoration(
          labelText: 'Email Address *',
          prefixIcon: const Icon(Icons.email),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
          ),
        ),
        keyboardType: TextInputType.emailAddress,
        validator: _validateEmail,
      ),
      const SizedBox(height: 16),

      // Phone Number Field
      TextFormField(
        controller: _phoneController,
        decoration: InputDecoration(
          labelText: 'Phone Number',
          prefixIcon: const Icon(Icons.phone),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
          ),
        ),
        keyboardType: TextInputType.phone,
      ),
      const SizedBox(height: 16),

      // User Role Dropdown
      DropdownButtonFormField<UserRole>(
        value: _selectedRole,
        decoration: InputDecoration(
          labelText: 'User Role *',
          prefixIcon: const Icon(Icons.security),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
          ),
        ),
        items: UserRole.values.map((role) {
          return DropdownMenuItem(
            value: role,
            child: Text(role.displayName),
          );
        }).toList(),
        onChanged: (UserRole? newRole) {
          if (newRole != null) {
            setState(() => _selectedRole = newRole);
          }
        },
      ),
      const SizedBox(height: 16),

      // Password Field
      TextFormField(
        controller: _passwordController,
        obscureText: !_isPasswordVisible,
        decoration: InputDecoration(
          labelText: 'Password *',
          prefixIcon: const Icon(Icons.lock),
          suffixIcon: IconButton(
            icon: Icon(
              _isPasswordVisible
                  ? Icons.visibility
                  : Icons.visibility_off,
            ),
            onPressed: () {
              setState(
                () => _isPasswordVisible = !_isPasswordVisible,
              );
            },
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
          ),
        ),
        validator: _validatePassword,
      ),
      const SizedBox(height: 16),

      // Confirm Password Field
      TextFormField(
        controller: _confirmPasswordController,
        obscureText: !_isConfirmPasswordVisible,
        decoration: InputDecoration(
          labelText: 'Confirm Password *',
          prefixIcon: const Icon(Icons.lock),
          suffixIcon: IconButton(
            icon: Icon(
              _isConfirmPasswordVisible
                  ? Icons.visibility
                  : Icons.visibility_off,
            ),
            onPressed: () {
              setState(
                () => _isConfirmPasswordVisible = !_isConfirmPasswordVisible,
              );
            },
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
          ),
        ),
        validator: _validateConfirmPassword,
      ),
      const SizedBox(height: 20),

      // Sign Up Button
      Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return ElevatedButton(
            onPressed: authProvider.isLoading ? null : _handleSignUp,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue[700],
              disabledBackgroundColor: Colors.grey[400],
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: authProvider.isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    'Create Account',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
          );
        },
      ),
      const SizedBox(height: 16),

      // Back Button
      ElevatedButton.icon(
        onPressed: () {
          Navigator.of(context).pushReplacementNamed(AppRouter.homeRoute);
        },
        icon: const Icon(Icons.arrow_back),
        label: const Text('Back to Dashboard'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.grey[600],
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final isMobileLayout = MediaQuery.of(context).size.width < 600;
    final currentRoute = ModalRoute.of(context)?.settings.name;
    final isAdminCreateAccount = currentRoute == AppRouter.createAccountRoute;

    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        // If accessing create account route, verify user is admin
        if (isAdminCreateAccount) {
          final isAdmin = authProvider.currentUser?.role == UserRole.admin ||
              authProvider.currentUser?.role == UserRole.superAdmin;

          if (!authProvider.isAuthenticated || !isAdmin) {
            return Scaffold(
              appBar: AppBar(
                title: const Text('Access Denied'),
                backgroundColor: Colors.red[700],
              ),
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.lock_outline,
                      size: 80,
                      color: Colors.red[700],
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Admin Access Required',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            color: Colors.red[700],
                          ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Only administrators can create new accounts',
                      style: Theme.of(context).textTheme.bodyLarge,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 30),
                    ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue[700],
                      ),
                      child: const Text('Go Back'),
                    ),
                  ],
                ),
              ),
            );
          }
        }

        // Build the form content
        final formContent = Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.all(isMobileLayout ? 20.0 : 40.0),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 450),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: _buildFormFields(context),
                  ),
                ),
              ),
            ),
          ),
        );

        // Show drawer for admin creating account, otherwise show form centered
        return Scaffold(
          body: isAdminCreateAccount
              ? Row(
                  children: [
                    const AppDrawer(),
                    Expanded(child: formContent),
                  ],
                )
              : formContent,
        );
      },
    );
}
}

