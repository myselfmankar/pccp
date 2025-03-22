if decrypted_coordinates is None: 
                return jsonify({'message': 'Decryption error'}), 500

            if len(coordinates) != len(decrypted_coordinates):
                return jsonify({'message': 'Incorrect number of PCCP coordinates'}), 401

            sent_coordinates_set = {(int(coord['x']), int(coord['y'])) for coord in coordinates}
            stored_coordinates_set = {(int(coord['x']), int(coord['y'])) for coord in decrypted_coordinates}

            if sent_coordinates_set == stored_coordinates_set:
                access_token = create_access_token(identity=user_email)
                return jsonify({'access_token': access_token}), 200
            else:
                return jsonify({'message': 'Incorrect PCCP coordinates'}), 401