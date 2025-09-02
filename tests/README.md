# BarberManager - Testing Documentation

## 🧪 Testing Framework

This project uses **pytest** as the main testing framework with comprehensive test coverage for critical functionality.

## 📁 Test Structure

```
tests/
├── __init__.py                 # Package initialization
├── conftest.py                 # Test configuration and fixtures
├── test_auth.py               # Authentication tests
├── test_appointments.py       # Appointment management tests
├── test_clients.py            # Client management tests
├── test_pos.py               # Point of Sale tests
├── test_cash.py              # Cash management tests
└── ...                       # Additional test modules
```

## 🚀 Quick Start

### Install Test Dependencies

```bash
# Install all dependencies including test packages
pip install -e .
```

### Run All Tests

```bash
# Using pytest directly
pytest

# Using the test runner script
python run_tests.py all
```

### Run Specific Test Types

```bash
# Unit tests only
python run_tests.py unit

# Integration tests only
python run_tests.py integration

# Authentication tests only
python run_tests.py auth

# Quick tests (stop on first failure)
python run_tests.py quick

# Tests with coverage analysis
python run_tests.py coverage
```

## 📊 Coverage Analysis

The project aims for **70%+ test coverage** on critical components:

```bash
# Generate coverage report
pytest --cov=backend --cov-report=html --cov-report=term

# View HTML coverage report
open htmlcov/index.html
```

## 🏗️ Test Categories

### ✅ **Unit Tests**
- Authentication and authorization
- CRUD operations
- Business logic validation
- Data model relationships

### 🔗 **Integration Tests**
- API endpoint functionality
- Database operations
- Cross-module interactions
- End-to-end workflows

### 🔒 **Security Tests**
- Role-based access control
- Input validation
- Authentication flows
- Authorization boundaries

## 🧪 Test Fixtures

### Database Fixtures
- `db_session`: Isolated database session for each test
- `admin_user`: Admin user with full permissions
- `barber_user`: Barber user with limited permissions
- `test_client`: Sample client for testing
- `test_service`: Sample service for testing

### Authentication Fixtures
- `admin_token`: JWT token for admin user
- `barber_token`: JWT token for barber user
- `auth_headers`: Authorization headers for admin
- `barber_headers`: Authorization headers for barber

### Test Client
- `client`: FastAPI test client for API testing

## 📝 Writing Tests

### Test Naming Convention

```python
def test_[functionality]_[scenario]():
    """Clear description of what the test validates"""
    pass
```

### Example Test Structure

```python
def test_create_appointment_success(client, auth_headers, test_client, barber_user, test_service):
    """Test successful appointment creation"""
    # Arrange
    appointment_data = {
        "cliente_id": test_client.id,
        "barbeiro_id": barber_user.id,
        "servico_id": test_service.id,
        "data_hora": (datetime.now() + timedelta(days=1)).isoformat()
    }
    
    # Act
    response = client.post("/api/appointments/", json=appointment_data, headers=auth_headers)
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["cliente_id"] == test_client.id
    assert data["status"] == "agendado"
```

## 🎯 Critical Test Areas

### 1. **Authentication System**
- ✅ Login validation
- ✅ JWT token handling
- ✅ Role-based access control
- ✅ Unauthorized access prevention

### 2. **Appointment Management**
- ✅ Appointment CRUD operations
- ✅ Conflict detection algorithms
- ✅ Date/time validation
- ✅ Status workflow management

### 3. **Client Management**
- ✅ Client CRUD operations
- ✅ LGPD compliance tracking
- ✅ Data validation and uniqueness
- ✅ Search and pagination

### 4. **Point of Sale System**
- ✅ Sales transaction creation
- ✅ Multiple payment methods
- ✅ Discount calculations
- ✅ Multi-item sales processing

### 5. **Cash Management**
- ✅ Cash register operations
- ✅ Opening/closing validation
- ✅ Multiple cash prevention
- ✅ User isolation

## 🔧 Test Configuration

### Pytest Configuration (`pytest.ini`)

```ini
[tool:pytest]
testpaths = tests
addopts = 
    -v
    --tb=short
    --cov=backend
    --cov-report=html
    --cov-fail-under=70
```

### Environment Setup

Tests use a separate SQLite database (`test.db`) that is:
- Created fresh for each test session
- Isolated per test function
- Automatically cleaned up

### Mocking and Fixtures

- **Database**: In-memory SQLite for fast testing
- **Authentication**: Real JWT tokens with test users
- **External Services**: Mocked email/SMS services

## 🚨 Test Guidelines

### Do's ✅
- Write descriptive test names
- Use appropriate fixtures
- Test both success and failure cases
- Validate business rules
- Test edge cases and boundary conditions

### Don'ts ❌
- Don't test external dependencies directly
- Don't create tests that depend on specific data
- Don't write overly complex test logic
- Don't ignore test failures
- Don't skip validation tests

## 🎭 Test Markers

```python
@pytest.mark.unit
def test_calculation():
    """Unit test for calculation logic"""
    pass

@pytest.mark.integration  
def test_api_workflow():
    """Integration test for API workflow"""
    pass

@pytest.mark.slow
def test_performance():
    """Performance test (may take longer)"""
    pass
```

## 📈 Continuous Integration

### Local Testing Workflow

```bash
# 1. Run quick tests during development
python run_tests.py quick

# 2. Run full test suite before commit
python run_tests.py all

# 3. Check coverage periodically
python run_tests.py coverage
```

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: pip install -e .
      - name: Run tests
        run: python run_tests.py coverage
```

## 🔍 Debugging Tests

### Running Single Test

```bash
# Run specific test file
pytest tests/test_auth.py -v

# Run specific test function
pytest tests/test_auth.py::test_login_success -v

# Run with detailed output
pytest tests/test_auth.py::test_login_success -v -s
```

### Test Database Inspection

```python
# In conftest.py, you can add debugging
@pytest.fixture(scope="function")
def debug_db(db_session):
    """Debug database fixture"""
    yield db_session
    
    # Print database contents for debugging
    users = db_session.query(User).all()
    print(f"Users in DB: {len(users)}")
```

## 🎯 Test Metrics

### Current Coverage Goals
- **Authentication**: 100% (critical security component)
- **Appointments**: 95% (core business logic)
- **Clients**: 90% (data management)
- **POS**: 90% (financial transactions)
- **Cash**: 95% (financial control)
- **Overall**: 70%+ (project-wide coverage)

### Performance Benchmarks
- Unit tests: < 1s per test
- Integration tests: < 5s per test
- Full test suite: < 60s total

This comprehensive testing framework ensures code quality, prevents regressions, and validates business requirements throughout the development lifecycle.