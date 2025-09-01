import { Link } from "react-router-dom";

const Home = () => {

    return (
        <div>
            <h2>홈 메인</h2>

            <Link to="/phti/survey">PHTI 설문</Link>
        </div>
    );
}

export default Home;