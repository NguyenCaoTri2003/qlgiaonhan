module.exports = function checkPermission(permission) {
  return (req, res, next) => {
    const permissions = req.user?.permissions;

    if (!permissions || permissions.length === 0) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    const userPermission = permissions[0];

    if (!userPermission[permission] || userPermission[permission] <= 0) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện chức năng này" });
    }

    next();
  };
};