import styled from'styled-components';
import style from '../../assets/global-style';

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: ${props => props.play > 0 ? "60px": 0};
  width: 100%;
  z-index: 100;
  overflow: hidden;
  background: #f2f3f4;
  transform-origin: right bottom;
  &.fly-enter, &.fly-appear {
    transform:  translate3d(0, 100%, 0);
  }
  &.fly-enter-active, &.fly-appear-active {
    transition: transform .3s;
    transform:  translate3d(0, 0, 0);
  }
  &.fly-exit {
    transform:  translate3d(0, 0, 0);
  }
  &.fly-exit-active {
    transition: transform .3s;
    transform:  translate3d(0, 100%, 0);
  }
`