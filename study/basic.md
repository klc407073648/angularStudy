# 三大主流前端框架

## 对比

| 对比项 | React | Vue | Angular |
| :--- | :--- | :--- | :--- |
| **渲染机制** | 虚拟 DOM（Virtual DOM） | 响应式系统 + 虚拟 DOM | **真实 DOM + 变更检测**（Change Detection） |
| **性能优化** | 需手动优化（如 `React.memo`, `useCallback`） | 响应式系统自动优化 | 提供 `OnPush` 策略优化变更检测 |
| **实际表现** | 通常非常快，尤其在频繁更新时 | 表现良好,响应最快 |优化得当后性能优秀，但默认模式可能较慢 |
| **主要语言** | JavaScript / JSX /TSX | Vue | TypeScript / HTML |
| **组件定义方式** |	单文件组件（SFC）或 Composition API |	函数组件 + Hooks	|类组件 + 装饰器|

示例

### React (Function Component + Hooks)

```tsx
// Greeting.tsx
import { useState } from 'react';

function Greeting() {
  const [message, setMessage] = useState('Hello React!');

  const updateMessage = () => {
    setMessage('Message updated!');
  };

  return (
    <div>
      <p>{message}</p>
      <button onClick={updateMessage}>Update</button>
    </div>
  );
}

export default Greeting;
```

### Vue (Composition API + <script setup>)

```ts
<!-- Greeting.vue -->
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="updateMessage">Update</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue!')

function updateMessage() {
  message.value = 'Message updated!'
}
</script>

<style scoped>
button { color: blue; }
</style>
```

### Angular (Component)

```ts
// greeting.component.ts
import { Component } from '@angular/core';

//类组件 + @Component 装饰器
@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.css']
})
export class GreetingComponent {
  message = 'Hello Angular!';

  updateMessage() {
    this.message = 'Message updated!';
  }
}
```

* @Component 是一个装饰器，它接收一个配置对象，告诉 Angular 如何处理这个类。
* selector：定义该组件在模板中如何被引用（如 <app-hello></app-hello>）。
* templateUrl / template：指定 HTML 模板，可以是外部文件或内联字符串。
* styleUrls / styles：指定 CSS 样式文件或内联样式。

其他装饰器

* @Component：定义一个组件类，提供元数据
* @Input()：接收父组件传递的数据
* @Output() + EventEmitter：向父组件发送事件
* @ViewChild() / @ViewChildren()：访问子组件或 DOM 元素
* @Injectable()：标记服务类，使其可被注入（标记一个类可以被依赖注入系统管理的装饰器。它是创建服务（Service）的标准方式。）
* @HostListener() / @HostBinding()：监听宿主元素事件或绑定属性

## ✅ Angular 编码规范实施步骤

| 步骤 | 工具 | 目的 |
|------|------|------|
| 1. 格式化代码 | Prettier | 统一代码风格 |
| 2. 静态检查 | ESLint + @angular-eslint | 检测错误和不良实践 |
| 3. 自动修复 | `ng lint --fix` | 自动修正部分问题 |
| 4. 提交拦截 | Husky + lint-staged | 提交前自动检查 |
| 5. CI/CD 集成 | GitHub Actions / Jenkins | 持续集成中执行 lint |