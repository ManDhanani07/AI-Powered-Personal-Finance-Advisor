class DomainException(Exception):
    """Base exception for all domain business errors."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class EntityNotFoundError(DomainException):
    """Raised when a requested entity cannot be found in database."""
    pass


class BusinessRuleError(DomainException):
    """Raised when a business rule constraint or validation fails."""
    pass


class AuthenticationError(DomainException):
    """Raised when authentication credentials fail validation."""
    pass


class ForbiddenError(DomainException):
    """Raised when an operation is prohibited for the current scope."""
    pass


class DuplicateRecordError(DomainException):
    """Raised when trying to insert or register duplicate unique keys."""
    pass
