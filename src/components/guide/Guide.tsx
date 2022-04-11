import { Button, Row, Col} from 'antd';
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from 'redux';
import { actionCreators, State } from '../../state';

function Guide() {
  const dispatch = useDispatch();
  const { depositMoney, withdrawMoney, bankruptMoney } = bindActionCreators(actionCreators, dispatch);
  const amount = useSelector((state: State) => state.bank)

  const handleDepositMoney = () => {
    depositMoney(100);
    console.log(amount);
  }

  return (
    <>
      <Row>
        <Col>
          {amount}
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={handleDepositMoney}>DEPOSIT</Button>
          <Button onClick={() => withdrawMoney(10)}>WITHDRAW</Button>
          <Button onClick={() => bankruptMoney()}>BANKRUPT</Button>
        </Col>
      </Row>
    </>
  );
}

export default Guide;