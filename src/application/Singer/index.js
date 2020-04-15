import React, { memo, useState } from 'react'
import { CSSTransition } from "react-transition-group";
import { Container } from "./style";


function Singer(props) {
  const { } = props
  const [showStatus, setShowStatus] = useState(true)

  return (
    <CSSTransition
      in={showStatus}
      timeout={300}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={() => props.history.goBack()}
    >
      <Container>
        hecun
      </Container>
    </CSSTransition>
  )
}

export default memo(Singer)