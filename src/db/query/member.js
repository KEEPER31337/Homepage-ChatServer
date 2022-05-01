import { poolPromise } from './connection';

const registerMember = async ({ id, nickName, thumbnailPath }) => {
  // TODO : Check room exist
  try {
    const QUERY_CREATE_MEMBER = `INSERT INTO member (id, nick_name, image_path) VALUES('${id}', '${nickName}', '${thumbnailPath}')`;
    const [result, fields] = await poolPromise.query(QUERY_CREATE_MEMBER);
    return result;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      // errno : 1062
      try {
        const QUERY_UPDATE_MEMBER = `UPDATE member SET nick_name='${nickName}', image_path='${thumbnailPath}'  WHERE id='${id}'`;
        const [result, fields] = await poolPromise.query(QUERY_UPDATE_MEMBER);
        return result;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
};
export { registerMember };
