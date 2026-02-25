import 'package:companion/features/auth/domain/repositories/auth_repository.dart';
import 'package:companion/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:companion/features/auth/data/datasources/firebase_auth_datasource.dart';

/// Service locator for authentication
class AuthService {
  static final _instance = AuthService._internal();

  late AuthRepository _repository;

  factory AuthService() {
    return _instance;
  }

  AuthService._internal() {
    _initialize();
  }

  void _initialize() {
    final datasource = FirebaseAuthDatasource();
    _repository = AuthRepositoryImpl(datasource: datasource);
  }

  AuthRepository get repository => _repository;
}
