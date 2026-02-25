/// Result of authentication operations
class AuthResult {
  final bool success;
  final String? message;
  final String? userId;
  final dynamic exception;

  AuthResult({
    required this.success,
    this.message,
    this.userId,
    this.exception,
  });

  factory AuthResult.success({
    required String message,
    String? userId,
  }) {
    return AuthResult(
      success: true,
      message: message,
      userId: userId,
    );
  }

  factory AuthResult.failure({
    required String message,
    dynamic exception,
  }) {
    return AuthResult(
      success: false,
      message: message,
      exception: exception,
    );
  }
}
