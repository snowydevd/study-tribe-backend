class User {
  constructor(name, email, password, role = "user", points) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.points = points;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.deletedAt = null;
  }
}

module.exports = User;
