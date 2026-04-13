/**
 * Domain Errors — Aura Divina
 *
 * Errores tipados que representan violaciones de invariantes del dominio
 * o reglas de negocio. La capa de aplicación puede capturarlos y mapearlos
 * a códigos HTTP en la capa de infraestructura (controladores).
 */

export class DomainError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  constructor(code: string, message: string, httpStatus = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export class OutOfCoverageZoneException extends DomainError {
  constructor(zone: string) {
    super(
      'OUT_OF_COVERAGE_ZONE',
      `Lo sentimos, aún no entregamos contraentrega en "${zone}". Próximamente expandiremos cobertura.`,
      422,
    );
  }
}

export class InsufficientStockException extends DomainError {
  constructor(productName: string) {
    super('INSUFFICIENT_STOCK', `No hay stock suficiente para "${productName}".`, 409);
  }
}

export class EmptyCartException extends DomainError {
  constructor() {
    super('EMPTY_CART', 'No puedes confirmar un pedido con el carrito vacío.', 400);
  }
}

export class InvalidPhoneException extends DomainError {
  constructor() {
    super('INVALID_PHONE', 'El número de celular no es válido (debe iniciar con 3 y tener 10 dígitos).', 400);
  }
}

export class EmailAlreadyExistsException extends DomainError {
  constructor(email: string) {
    super('EMAIL_ALREADY_EXISTS', `Ya existe una cuenta con el correo "${email}". Inicia sesión o usa "Continuar con Google".`, 409);
  }
}

export class InvalidCredentialsException extends DomainError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.', 401);
  }
}

export class UserNotFoundException extends DomainError {
  constructor() {
    super('USER_NOT_FOUND', 'Usuario no encontrado.', 404);
  }
}

export class AddressNotFoundException extends DomainError {
  constructor() {
    super('ADDRESS_NOT_FOUND', 'Dirección no encontrada.', 404);
  }
}

export class WeakPasswordException extends DomainError {
  constructor() {
    super('WEAK_PASSWORD', 'La contraseña debe tener al menos 8 caracteres.', 400);
  }
}

export class InvalidEmailException extends DomainError {
  constructor() {
    super('INVALID_EMAIL', 'El correo electrónico no es válido.', 400);
  }
}
