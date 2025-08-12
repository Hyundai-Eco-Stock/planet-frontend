import { test } from "@/api/test/test.api";
import { CustomCommonButton } from "@components/_custom/CustomButtons";

const Home = () => {

    const clickBtn = async () => {
        const res = await test();
        console.log(`test: ${res}`);
    }

    return (
        <div>
            <h2>홈</h2>
            <CustomCommonButton onClick={clickBtn} children="테스트" />
        </div>
    );
}

export default Home;