class User {
  constructor(name, email, password, role = "user", points = 0) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.points = points;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.deletedAt = null;
  }

  toPlainObject() {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      points: this.points,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}

module.exports = User;
