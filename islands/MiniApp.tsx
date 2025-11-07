import { useSignal } from "@preact/signals";

interface UserData {
  name: string;
  age: number;
  registered: string;
}

export default function MiniApp() {
  const userId = useSignal("");
  const userData = useSignal<UserData | null>(null);
  const loading = useSignal(false);

  const fetchUserData = async () => {
    if (!userId.value) return;

    loading.value = true;
    try {
      const response = await fetch(`/api/users/${userId.value}`);
      if (response.ok) {
        userData.value = await response.json();
      } else {
        alert("Пользователь не найден");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      loading.value = false;
    }
  };

  return (
    <main class="p-4 max-w-md mx-auto">
      <h1 class="text-2xl font-bold mb-4">Добро пожаловать в MiniApp!</h1>

      <div class="mb-4">
        <label class="block mb-2">ID пользователя Telegram:</label>
        <input
          type="text"
          value={userId.value}
          onInput={(e) => userId.value = e.currentTarget.value}
          class="w-full p-2 border rounded"
          placeholder="Введите ID пользователя"
        />
      </div>

      <button
        type="button"
        onClick={fetchUserData}
        disabled={loading.value}
        class="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
      >
        {loading.value ? "Загрузка..." : "Получить данные"}
      </button>

      {userData.value && (
        <div class="mt-4 p-4 border rounded">
          <h2 class="text-xl font-semibold">Данные пользователя:</h2>
          <p>
            <strong>Имя:</strong> {userData.value.name}
          </p>
          <p>
            <strong>Возраст:</strong> {userData.value.age}
          </p>
          <p>
            <strong>Зарегистрирован:</strong>{" "}
            {new Date(userData.value.registered).toLocaleDateString()}
          </p>
        </div>
      )}

      <div class="mt-6">
        <p class="text-sm text-gray-600">
          Этот MiniApp демонстрирует интеграцию Fresh 2.0, GramIO сценариев и
          Deno KV.
        </p>
      </div>
    </main>
  );
}
