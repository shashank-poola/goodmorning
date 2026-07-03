import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import styles from './RecapWidget.module.css'

export function RecapWidget() {
  const state = useWidgetData(provider.getYesterdayRecap)
  return (
    <Panel title="Yesterday Recap" accent="cyan" id="recap">
      <WidgetBody {...state} isEmpty={(d) => d.bullets.length === 0}>
        {({ bullets }) => (
          <ul className={styles.list}>
            {bullets.map((b, i) => (
              <li key={i} className={styles.bullet}>
                {b}
              </li>
            ))}
          </ul>
        )}
      </WidgetBody>
    </Panel>
  )
}
