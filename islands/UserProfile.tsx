import { useAuth } from "@/hooks/useAuth.ts";

export default function UserProfile() {
  const { authState, logout } = useAuth();

  if (!authState.isAuthenticated) {
    return (
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Профиль пользователя</h2>
        <p class="text-gray-600">Вы не авторизованы</p>
        <a
          href="/auth"
          class="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Войти через Telegram
        </a>
      </div>
    );
  }

  return (
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Профиль пользователя</h2>

      <div class="space-y-2">
        <p>
          <strong>Имя:</strong> {authState.user?.name}
        </p>
        <p>
          <strong>Возраст:</strong> {authState.user?.age}
        </p>
        {authState.user?.username && (
          <p>
            <strong>Username:</strong> @{authState.user.username}
          </p>
        )}
        <p>
          <strong>Дата регистрации:</strong>{" "}
          {new Date(authState.user?.registered || "").toLocaleDateString()}
        </p>
      </div>

      <div class="mt-6 space-y-2">
        <button
          type="button"
          onClick={logout}
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
