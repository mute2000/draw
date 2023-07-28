<template>
    <div>
      <h2>登录</h2>
      <form @submit.prevent="login">
        <input v-model="loginUsername" placeholder="用户名" required />
        <input v-model="loginPassword" type="password" placeholder="密码" required />
        <button type="submit">登录</button>
      </form>
      <h2>注册</h2>
      <form @submit.prevent="register">
        <input v-model="registerUsername" placeholder="用户名" required />
        <input v-model="registerPassword" type="password" placeholder="密码" required />
        <button type="submit">注册</button>
      </form>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    setup() {
      const loginUsername = ref('');
      const loginPassword = ref('');
      const registerUsername = ref('');
      const registerPassword = ref('');
  
const login = async () => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: loginUsername.value,
        password: loginPassword.value,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('登录成功:', data);
      // 处理登录成功的情况，例如跳转到其他页面
    } else {
      const error = await response.json();
      console.error('登录失败:', error);
      // 处理登录失败的情况，例如显示错误消息
    }
  } catch (error) {
    console.error('请求错误:', error);
    // 处理请求错误的情况，例如网络错误
  }
};

const register = async () => {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: registerUsername.value,
        password: registerPassword.value,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('注册成功:', data);
      // 处理注册成功的情况，例如跳转到其他页面
    } else {
      const error = await response.json();
      console.error('注册失败:', error);
      // 处理注册失败的情况，例如显示错误消息
    }
  } catch (error) {
    console.error('请求错误:', error);
    // 处理请求错误的情况，例如网络错误
  }
};
  
      return {
        loginUsername,
        loginPassword,
        registerUsername,
        registerPassword,
        login,
        register,
      };
    },
  };
  </script>