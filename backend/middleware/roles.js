// roles.js

const roles = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    LEADER: 'leader',
    TEACHER: 'teacher',
    USER: 'user',
};

// Quyền cho từng vai trò
const permissions = {
    [roles.SUPERADMIN]: [
        'create_user', 'delete_user', 'update_user', 'view_user',
        'create_role', 'delete_role', 'update_role', 'view_role',
        'manage_all_exercises', 'manage_all_exams', 'manage_questions', 'manage_question_banks',
    ],
    [roles.ADMIN]: [
        'create_user', 'update_user', 'view_user',
        'create_role', 'update_role', 'view_role',
        'manage_all_exercises', 'manage_all_exams', 'manage_questions', 'manage_question_banks',
    ],
    [roles.MANAGER]: [
        'update_user', 'view_user',
        'manage_all_exercises', 'manage_all_exams', 'manage_questions', 'manage_question_banks',
    ],
    [roles.LEADER]: [
        'view_user', 'manage_team_exercises', 'manage_team_exams', 'manage_questions',
    ],
    [roles.TEACHER]: [
        'view_user', 'create_exercise', 'update_exercise', 'delete_exercise', 'view_exercise',
        'create_exam', 'update_exam', 'delete_exam', 'view_exam',
        'create_question', 'update_question', 'delete_question', 'view_question',
    ],
    [roles.USER]: [
        'view_exercise', 'submit_exercise', 'view_exam', 'take_exam', 'view_question',
    ],
};

// Kiểm tra quyền của người dùng
function hasPermission(role, permission) {
    return permissions[role] && permissions[role].includes(permission);
}

module.exports = { roles, permissions, hasPermission };
