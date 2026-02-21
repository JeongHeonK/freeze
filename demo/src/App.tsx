import WithoutFreeze from "./WithoutFreeze";
import WithFreeze from "./WithFreeze";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1 className="title">
          <span className="pkg">@jeonheonkim/freeze</span> demo
        </h1>
        <p className="subtitle">
          Exit animation 중 콘텐츠 변경을 방지하는 React 라이브러리
        </p>
      </header>

      <main className="columns">
        <section className="column column--bad">
          <div className="column-header">
            <span className="badge badge--bad">Before</span>
            <h2>Without freeze</h2>
            <p className="column-desc">
              팝오버가 닫히는 동안 카운터가 계속 변경됩니다.
            </p>
          </div>
          <WithoutFreeze />
        </section>

        <div className="divider" />

        <section className="column column--good">
          <div className="column-header">
            <span className="badge badge--good">After</span>
            <h2>With freeze</h2>
            <p className="column-desc">
              닫히는 동안 카운터가 마지막 값으로 고정됩니다.
            </p>
          </div>
          <WithFreeze />
        </section>
      </main>
    </div>
  );
}
